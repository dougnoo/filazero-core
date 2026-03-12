#!/bin/bash

# Script de gerenciamento do ambiente Docker de desenvolvimento
# Uso: ./docker-dev.sh [comando]

set -e

COMPOSE_FILE="docker-compose.local.yml"
CONTAINER_APP="handslab-trya-backend-local"
CONTAINER_DB="handslab-trya-postgres-local"
PORT="${PORT:-3000}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verifica se containers estão rodando
check_status() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Status dos Containers"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    APP_STATUS=$(docker ps --filter "name=$CONTAINER_APP" --format "{{.Status}}" 2>/dev/null || echo "")
    DB_STATUS=$(docker ps --filter "name=$CONTAINER_DB" --format "{{.Status}}" 2>/dev/null || echo "")
    
    if [ -n "$APP_STATUS" ]; then
        print_success "Backend: $APP_STATUS"
    else
        print_error "Backend: Não está rodando"
    fi
    
    if [ -n "$DB_STATUS" ]; then
        print_success "PostgreSQL: $DB_STATUS"
    else
        print_error "PostgreSQL: Não está rodando"
    fi
    
    echo ""
    
    # Testa se API está respondendo
    if [ -n "$APP_STATUS" ]; then
        if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
            print_success "API respondendo em http://localhost:$PORT"
            echo ""
            print_info "Swagger UI: http://localhost:$PORT/api/docs"
        else
            print_error "API não está respondendo na porta $PORT"
            print_info "Verificando logs..."
            echo ""
            docker logs $CONTAINER_APP --tail=20
        fi
    fi
    
    echo ""
}

# Para os containers
stop() {
    print_info "Parando containers..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Containers parados"
}

# Para e remove volumes (limpa banco de dados)
clean() {
    print_info "Parando containers e limpando volumes..."
    docker-compose -f $COMPOSE_FILE down -v
    print_success "Containers e volumes removidos"
}

# Constrói as imagens
build() {
    print_info "Construindo imagens Docker..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    print_success "Imagens construídas com sucesso"
}

# Sobe os containers
up() {
    FOLLOW_LOGS=false
    
    # Verifica se já está rodando
    APP_RUNNING=$(docker ps --filter "name=$CONTAINER_APP" --format "{{.Status}}" 2>/dev/null || echo "")
    
    if [ -n "$APP_RUNNING" ]; then
        print_error "Containers já estão rodando!"
        echo ""
        check_status
        echo ""
        print_info "Para reiniciar: ./docker-dev.sh restart"
        print_info "Para parar: ./docker-dev.sh stop"
        print_info "Para ver logs: ./docker-dev.sh logs"
        return 1
    fi
    
    # Verifica flags
    for arg in "$@"; do
        case $arg in
            -f|--follow)
                FOLLOW_LOGS=true
                shift
                ;;
        esac
    done
    
    if [ "$FOLLOW_LOGS" = true ]; then
        print_info "Subindo containers com logs..."
        docker-compose -f $COMPOSE_FILE up
    else
        print_info "Subindo containers..."
        docker-compose -f $COMPOSE_FILE up -d
        
        sleep 3
        
        print_success "Containers iniciados"
        echo ""
        check_status
        echo ""
        print_info "Para ver os logs, use: ./docker-dev.sh logs"
        print_info "Ou suba com logs: ./docker-dev.sh up -f"
    fi
}

# Sobe com logs visíveis
up_logs() {
    print_info "Subindo containers com logs..."
    docker-compose -f $COMPOSE_FILE up
}

# Restart completo
restart() {
    print_info "Reiniciando ambiente..."
    stop
    sleep 2
    up
}

# Rebuild completo (para e reconstrói tudo)
rebuild() {
    print_info "Rebuild completo do ambiente..."
    stop
    build
    up
}

# Ver logs
logs() {
    SERVICE=${1:-app}
    TAIL=${2:-100}
    
    if [ "$SERVICE" == "app" ]; then
        docker logs $CONTAINER_APP --tail=$TAIL -f
    elif [ "$SERVICE" == "db" ]; then
        docker logs $CONTAINER_DB --tail=$TAIL -f
    else
        docker-compose -f $COMPOSE_FILE logs --tail=$TAIL -f
    fi
}

# Acessa o shell do container
shell() {
    SERVICE=${1:-app}
    
    if [ "$SERVICE" == "app" ]; then
        docker exec -it $CONTAINER_APP sh
    elif [ "$SERVICE" == "db" ]; then
        docker exec -it $CONTAINER_DB psql -U postgres -d trya
    fi
}

# Executa comandos no container
exec_cmd() {
    docker exec -it $CONTAINER_APP sh -c "$@"
}

# Mostra ajuda
help() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Docker Dev - Trya Backend"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Uso: ./docker-dev.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  status          - Verifica status dos containers"
    echo "  up [-f]         - Sobe os containers (background)"
    echo "                    -f, --follow: Mostra logs após subir"
    echo "  up-logs         - Sube os containers (com logs)"
    echo "  stop            - Para os containers"
    echo "  restart         - Reinicia os containers"
    echo "  clean           - Para e remove volumes (limpa BD)"
    echo "  build           - Reconstrói as imagens"
    echo "  rebuild         - Para, reconstrói e sobe tudo"
    echo "  logs [service]  - Mostra logs (app|db|all)"
    echo "  shell [service] - Acessa shell (app|db)"
    echo "  exec <cmd>      - Executa comando no container app"
    echo ""
    echo "Exemplos:"
    echo "  ./docker-dev.sh status"
    echo "  ./docker-dev.sh up"
    echo "  ./docker-dev.sh up -f            # Com logs"
    echo "  ./docker-dev.sh up --follow      # Com logs"
    echo "  ./docker-dev.sh logs app"
    echo "  ./docker-dev.sh shell db"
    echo "  ./docker-dev.sh exec 'pnpm run seed:all'"
    echo ""
}

# Menu principal
case "$1" in
    status)
        check_status
        ;;
    up)
        up "${@:2}"
        ;;
    up-logs)
        up_logs
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    clean)
        clean
        ;;
    build)
        build
        ;;
    rebuild)
        rebuild
        ;;
    logs)
        logs "${@:2}"
        ;;
    shell)
        shell "${@:2}"
        ;;
    exec)
        exec_cmd "${@:2}"
        ;;
    help|--help|-h|"")
        help
        ;;
    *)
        print_error "Comando desconhecido: $1"
        echo ""
        help
        exit 1
        ;;
esac
