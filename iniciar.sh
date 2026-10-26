#!/bin/bash

NAMESPACE="microservicios"
DIRECTORIO="$(cd "$(dirname "$0")" && pwd)"

iniciar() {
    echo "Iniciando microservicios en Kubernetes..."

    kubectl apply -f "$DIRECTORIO/k8s/bases-datos.yaml"
    kubectl apply -f "$DIRECTORIO/k8s/microservicios.yaml"

    echo "Esperando que los despliegues estén listos..."
    kubectl rollout status deployment/postgres -n "$NAMESPACE" --timeout=180s
    kubectl rollout status deployment/usuarios -n "$NAMESPACE" --timeout=180s
    kubectl rollout status deployment/productos -n "$NAMESPACE" --timeout=180s
    kubectl rollout status deployment/pedidos -n "$NAMESPACE" --timeout=180s

    echo "Microservicios iniciados."
    kubectl get pods,services -n "$NAMESPACE"
}

detener() {
    echo "Deteniendo microservicios..."

    kubectl scale deployment usuarios productos pedidos \
        --replicas=0 -n "$NAMESPACE"

    echo "Microservicios detenidos."
    echo "PostgreSQL continúa funcionando y conserva sus datos."
}

case "$1" in
    iniciar)
        iniciar
        ;;
    detener)
        detener
        ;;
    *)
        echo "Uso: $0 {iniciar|detener}"
        exit 1
        ;;
esac
