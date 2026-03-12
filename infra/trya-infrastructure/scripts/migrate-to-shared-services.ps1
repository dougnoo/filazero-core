# =============================================================================
# Script de Migração para Shared Services
# =============================================================================
# Este script automatiza a migração de VPC e ACM para shared-services
# usando Terraform Import para evitar recriação de recursos

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("vpc", "acm", "all")]
    [string]$Resource,
    
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

# Função para executar comandos com log
function Invoke-Command {
    param($Command, $WorkingDirectory = ".")
    
    Write-Info "Executando: $Command"
    if ($DryRun) {
        Write-Warning "DRY RUN - Comando não executado"
        return
    }
    
    Push-Location $WorkingDirectory
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            throw "Comando falhou com código $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

# Função para fazer backup do state
function Backup-TerraformState {
    param($Path, $BackupName)
    
    Write-Info "Fazendo backup do state: $BackupName"
    
    if ($DryRun) {
        Write-Warning "DRY RUN - Backup não executado"
        return
    }
    
    $backupDir = "backups/terraform-states"
    if (!(Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    Push-Location $Path
    try {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupFile = "$backupDir/$BackupName-$timestamp.json"
        
        terragrunt state pull > $backupFile
        Write-Success "Backup salvo em: $backupFile"
    }
    finally {
        Pop-Location
    }
}

# Função para obter outputs do Terragrunt
function Get-TerragruntOutput {
    param($Path, $OutputName)
    
    Push-Location $Path
    try {
        $output = terragrunt output -raw $OutputName 2>$null
        return $output
    }
    catch {
        Write-Warning "Não foi possível obter output '$OutputName' de $Path"
        return $null
    }
    finally {
        Pop-Location
    }
}

# Função para migrar VPC
function Migrate-VPC {
    Write-Info "=== Iniciando migração do VPC ==="
    
    $oldVpcPath = "$AccountPath/stack/networking/vpc"
    $newVpcPath = "$AccountPath/shared-services/vpc"
    
    # Verificar se paths existem
    if (!(Test-Path $oldVpcPath)) {
        Write-Error "Path antigo do VPC não encontrado: $oldVpcPath"
        return
    }
    
    if (!(Test-Path $newVpcPath)) {
        Write-Error "Path novo do VPC não encontrado: $newVpcPath"
        return
    }
    
    # Backup do state atual
    Backup-TerraformState -Path $oldVpcPath -BackupName "vpc-old-state"
    
    # Obter IDs dos recursos atuais
    Write-Info "Obtendo IDs dos recursos do VPC..."
    $vpcId = Get-TerragruntOutput -Path $oldVpcPath -OutputName "vpc_id"
    $publicSubnetIds = Get-TerragruntOutput -Path $oldVpcPath -OutputName "public_subnet_ids"
    $privateSubnetIds = Get-TerragruntOutput -Path $oldVpcPath -OutputName "private_subnet_ids"
    
    if (!$vpcId) {
        Write-Error "Não foi possível obter VPC ID"
        return
    }
    
    Write-Success "VPC ID: $vpcId"
    
    # Inicializar novo path
    Write-Info "Inicializando novo path do VPC..."
    Invoke-Command -Command "terragrunt init" -WorkingDirectory $newVpcPath
    
    # Import do VPC
    Write-Info "Importando VPC..."
    Invoke-Command -Command "terragrunt import aws_vpc.this $vpcId" -WorkingDirectory $newVpcPath
    
    # Import das subnets (se disponíveis)
    if ($publicSubnetIds) {
        $publicSubnets = $publicSubnetIds -split ","
        for ($i = 0; $i -lt $publicSubnets.Length; $i++) {
            $subnetId = $publicSubnets[$i].Trim()
            Write-Info "Importando subnet pública [$i]: $subnetId"
            Invoke-Command -Command "terragrunt import 'aws_subnet.public[$i]' $subnetId" -WorkingDirectory $newVpcPath
        }
    }
    
    if ($privateSubnetIds) {
        $privateSubnets = $privateSubnetIds -split ","
        for ($i = 0; $i -lt $privateSubnets.Length; $i++) {
            $subnetId = $privateSubnets[$i].Trim()
            Write-Info "Importando subnet privada [$i]: $subnetId"
            Invoke-Command -Command "terragrunt import 'aws_subnet.private[$i]' $subnetId" -WorkingDirectory $newVpcPath
        }
    }
    
    # Verificar se import foi bem-sucedido
    Write-Info "Verificando import com terragrunt plan..."
    Invoke-Command -Command "terragrunt plan" -WorkingDirectory $newVpcPath
    
    Write-Success "Migração do VPC concluída!"
    Write-Warning "IMPORTANTE: Atualize as dependências em outros arquivos para apontar para: ../../shared-services/vpc"
}

# Função para migrar ACM
function Migrate-ACM {
    Write-Info "=== Iniciando migração do ACM ==="
    
    $oldAcmPath = "$AccountPath/stack/security/acm"
    $newAcmPath = "$AccountPath/shared-services/acm"
    
    # Verificar se paths existem
    if (!(Test-Path $oldAcmPath)) {
        Write-Error "Path antigo do ACM não encontrado: $oldAcmPath"
        return
    }
    
    if (!(Test-Path $newAcmPath)) {
        Write-Error "Path novo do ACM não encontrado: $newAcmPath"
        return
    }
    
    # Backup do state atual
    Backup-TerraformState -Path $oldAcmPath -BackupName "acm-old-state"
    
    # Obter ARN do certificado atual
    Write-Info "Obtendo ARN do certificado..."
    $certArn = Get-TerragruntOutput -Path $oldAcmPath -OutputName "certificate_arn"
    
    if (!$certArn) {
        Write-Error "Não foi possível obter Certificate ARN"
        return
    }
    
    Write-Success "Certificate ARN: $certArn"
    
    # Inicializar novo path
    Write-Info "Inicializando novo path do ACM..."
    Invoke-Command -Command "terragrunt init" -WorkingDirectory $newAcmPath
    
    # Import do certificado
    Write-Info "Importando certificado ACM..."
    Invoke-Command -Command "terragrunt import aws_acm_certificate.this $certArn" -WorkingDirectory $newAcmPath
    
    # Verificar se import foi bem-sucedido
    Write-Info "Verificando import com terragrunt plan..."
    Invoke-Command -Command "terragrunt plan" -WorkingDirectory $newAcmPath
    
    Write-Success "Migração do ACM concluída!"
    Write-Warning "IMPORTANTE: Atualize as dependências em outros arquivos para apontar para: ../../shared-services/acm"
}

# Função principal
function Main {
    Write-Info "=== Script de Migração para Shared Services ==="
    Write-Info "Recurso: $Resource"
    Write-Info "Account Path: $AccountPath"
    Write-Info "Dry Run: $DryRun"
    Write-Info ""
    
    if ($DryRun) {
        Write-Warning "MODO DRY RUN ATIVADO - Nenhuma alteração será feita"
        Write-Info ""
    }
    
    switch ($Resource) {
        "vpc" { Migrate-VPC }
        "acm" { Migrate-ACM }
        "all" { 
            Migrate-VPC
            Write-Info ""
            Migrate-ACM
        }
    }
    
    Write-Info ""
    Write-Success "=== Migração concluída! ==="
    Write-Warning "PRÓXIMOS PASSOS:"
    Write-Warning "1. Atualize as dependências em todos os arquivos terragrunt.hcl"
    Write-Warning "2. Teste o deploy de um componente dependente"
    Write-Warning "3. Remova os diretórios antigos após confirmar que tudo funciona"
}

# Executar script
Main