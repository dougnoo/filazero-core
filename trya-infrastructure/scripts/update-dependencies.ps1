# =============================================================================
# Script para Atualizar Dependências para Shared Services
# =============================================================================
# Este script atualiza automaticamente as referências de dependências
# para apontar para a nova estrutura shared-services

param(
    [Parameter(Mandatory=$false)]
    [string]$AccountPath = "accounts/admin-trya-dev",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

# Cores para output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

# Mapeamento de dependências antigas para novas
$dependencyMappings = @{
    # VPC dependencies
    "../networking/vpc" = "../../shared-services/vpc"
    "../../networking/vpc" = "../../../shared-services/vpc"
    "../../../networking/vpc" = "../../../../shared-services/vpc"
    "../../../../networking/vpc" = "../../../../../shared-services/vpc"
    
    # ACM dependencies  
    "../security/acm" = "../../shared-services/acm"
    "../../security/acm" = "../../../shared-services/acm"
    "../../../security/acm" = "../../../../shared-services/acm"
    "../../../../security/acm" = "../../../../../shared-services/acm"
}

# Função para atualizar arquivo
function Update-TerragruntFile {
    param($FilePath)
    
    if (!(Test-Path $FilePath)) {
        Write-Warning "Arquivo não encontrado: $FilePath"
        return
    }
    
    Write-Info "Processando: $FilePath"
    
    $content = Get-Content $FilePath -Raw
    $originalContent = $content
    $updated = $false
    
    # Atualizar cada mapeamento
    foreach ($oldPath in $dependencyMappings.Keys) {
        $newPath = $dependencyMappings[$oldPath]
        
        # Padrão para dependency blocks
        $pattern = "config_path\s*=\s*`"$([regex]::Escape($oldPath))`""
        $replacement = "config_path = `"$newPath`""
        
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
            $updated = $true
            Write-Success "  ✓ Atualizado: $oldPath → $newPath"
        }
    }
    
    # Salvar arquivo se houve mudanças
    if ($updated -and !$DryRun) {
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Success "  ✓ Arquivo salvo"
    } elseif ($updated -and $DryRun) {
        Write-Warning "  ⚠️  DRY RUN - Arquivo não salvo"
    } else {
        Write-Info "  ℹ️  Nenhuma alteração necessária"
    }
    
    return $updated
}

# Função para encontrar todos os arquivos terragrunt.hcl
function Get-TerragruntFiles {
    param($BasePath)
    
    $files = Get-ChildItem -Path $BasePath -Recurse -Name "terragrunt.hcl" | ForEach-Object {
        Join-Path $BasePath $_
    }
    
    # Excluir os arquivos da própria shared-services para evitar loops
    $files = $files | Where-Object { $_ -notmatch "shared-services" }
    
    return $files
}

# Função principal
function Main {
    Write-Info "=== Script de Atualização de Dependências ==="
    Write-Info "Account Path: $AccountPath"
    Write-Info "Dry Run: $DryRun"
    Write-Info ""
    
    if ($DryRun) {
        Write-Warning "MODO DRY RUN ATIVADO - Nenhuma alteração será feita"
        Write-Info ""
    }
    
    # Encontrar todos os arquivos terragrunt.hcl
    Write-Info "Procurando arquivos terragrunt.hcl..."
    $terragruntFiles = Get-TerragruntFiles -BasePath $AccountPath
    
    Write-Info "Encontrados $($terragruntFiles.Count) arquivos"
    Write-Info ""
    
    $updatedCount = 0
    
    # Processar cada arquivo
    foreach ($file in $terragruntFiles) {
        $wasUpdated = Update-TerragruntFile -FilePath $file
        if ($wasUpdated) {
            $updatedCount++
        }
        Write-Info ""
    }
    
    # Processar também arquivos _envcommon
    Write-Info "Processando arquivos _envcommon..."
    $envcommonFiles = Get-ChildItem -Path "_envcommon" -Name "*.hcl" -ErrorAction SilentlyContinue | ForEach-Object {
        Join-Path "_envcommon" $_
    }
    
    foreach ($file in $envcommonFiles) {
        $wasUpdated = Update-TerragruntFile -FilePath $file
        if ($wasUpdated) {
            $updatedCount++
        }
        Write-Info ""
    }
    
    Write-Success "=== Atualização concluída! ==="
    Write-Info "Arquivos atualizados: $updatedCount"
    
    if (!$DryRun -and $updatedCount -gt 0) {
        Write-Warning ""
        Write-Warning "PRÓXIMOS PASSOS:"
        Write-Warning "1. Revise as alterações com 'git diff'"
        Write-Warning "2. Teste o deploy de alguns componentes"
        Write-Warning "3. Commit as alterações se tudo estiver funcionando"
    }
}

# Executar script
Main