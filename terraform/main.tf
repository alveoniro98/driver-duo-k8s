terraform {
  required_version = ">= 1.5.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.25.0, < 3.0.0"
    }
  }
}

provider "kubernetes" {
  config_path = pathexpand(var.kubeconfig_path)
}

variable "kubeconfig_path" {
  description = "Path to the kubeconfig for the target Kubernetes cluster."
  type        = string
  default     = "~/.kube/config"
}

variable "app_image" {
  description = "Container image used by the application Deployment."
  type        = string
  default     = "alveoniro98/driver-duo:1.2"
}

variable "node_public_ip" {
  description = "Optional public IPv4 address of a Kubernetes node for the app URL output."
  type        = string
  default     = null
}

variable "postgres_user" {
  description = "PostgreSQL username."
  type        = string
  default     = "alveoniro"
}

variable "postgres_db" {
  description = "PostgreSQL database name."
  type        = string
  default     = "alveonirodb"
}

variable "postgres_password" {
  description = "Password used by PostgreSQL and the application."
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "Secret used to sign application session cookies."
  type        = string
  sensitive   = true
}

locals {
  namespace = "driver-duo"
}

resource "kubernetes_manifest" "namespace" {
  manifest = {
    apiVersion = "v1"
    kind       = "Namespace"
    metadata   = { name = local.namespace }
  }
}

resource "kubernetes_manifest" "app_secret" {
  manifest = {
    apiVersion = "v1"
    kind       = "Secret"
    metadata = {
      name      = "driver-duo-secret"
      namespace = local.namespace
    }
    type = "Opaque"
    stringData = {
      POSTGRES_USER     = var.postgres_user
      POSTGRES_DB       = var.postgres_db
      POSTGRES_PASSWORD = var.postgres_password
      SESSION_SECRET    = var.session_secret
      DATABASE_URL      = "postgresql://${urlencode(var.postgres_user)}:${urlencode(var.postgres_password)}@db:5432/${var.postgres_db}"
    }
  }

  depends_on = [kubernetes_manifest.namespace]
}

resource "kubernetes_manifest" "db_data" {
  manifest = {
    apiVersion = "v1"
    kind       = "PersistentVolumeClaim"
    metadata = {
      name      = "db-data"
      namespace = local.namespace
    }
    spec = {
      accessModes = ["ReadWriteOnce"]
      resources = {
        requests = { storage = "1Gi" }
      }
    }
  }

  depends_on = [kubernetes_manifest.namespace]
}

resource "kubernetes_manifest" "db_deployment" {
  manifest = {
    apiVersion = "apps/v1"
    kind       = "Deployment"
    metadata = {
      name      = "db"
      namespace = local.namespace
    }
    spec = {
      replicas = 1
      strategy = { type = "Recreate" }
      selector = { matchLabels = { app = "db" } }
      template = {
        metadata = { labels = { app = "db" } }
        spec = {
          containers = [{
            name  = "postgres"
            image = "postgres:16"
            ports = [{ containerPort = 5432 }]
            envFrom = [{ secretRef = { name = "driver-duo-secret" } }]
            env = [{ name = "PGDATA", value = "/var/lib/postgresql/data/pgdata" }]
            volumeMounts = [{ name = "data", mountPath = "/var/lib/postgresql/data" }]
            readinessProbe = {
              exec = { command = ["sh", "-c", "pg_isready -U $POSTGRES_USER -d $POSTGRES_DB"] }
              periodSeconds = 5
            }
          }]
          volumes = [{ name = "data", persistentVolumeClaim = { claimName = "db-data" } }]
        }
      }
    }
  }

  depends_on = [kubernetes_manifest.app_secret, kubernetes_manifest.db_data]
}

resource "kubernetes_manifest" "db_service" {
  manifest = {
    apiVersion = "v1"
    kind       = "Service"
    metadata = {
      name      = "db"
      namespace = local.namespace
    }
    spec = {
      selector = { app = "db" }
      ports    = [{ port = 5432, targetPort = 5432 }]
    }
  }

  depends_on = [kubernetes_manifest.namespace]
}

resource "kubernetes_manifest" "app_deployment" {
  manifest = {
    apiVersion = "apps/v1"
    kind       = "Deployment"
    metadata = {
      name      = "app"
      namespace = local.namespace
    }
    spec = {
      replicas = 3
      selector = { matchLabels = { app = "driver-duo" } }
      template = {
        metadata = { labels = { app = "driver-duo" } }
        spec = {
          containers = [{
            name  = "app"
            image = var.app_image
            ports = [{ containerPort = 3000 }]
            env = [{
              name      = "DATABASE_URL"
              valueFrom = { secretKeyRef = { name = "driver-duo-secret", key = "DATABASE_URL" } }
            }]
            envFrom = [{ secretRef = { name = "driver-duo-secret" } }]
            readinessProbe = {
              httpGet = { path = "/", port = 3000 }
              initialDelaySeconds = 10
              periodSeconds       = 5
              timeoutSeconds      = 3
              failureThreshold    = 6
            }
            resources = {
              requests = { cpu = "100m", memory = "128Mi" }
              limits   = { cpu = "500m", memory = "512Mi" }
            }
          }]
        }
      }
    }
  }

  depends_on = [kubernetes_manifest.app_secret, kubernetes_manifest.db_service]
}

resource "kubernetes_manifest" "app_service" {
  manifest = {
    apiVersion = "v1"
    kind       = "Service"
    metadata = {
      name      = "app"
      namespace = local.namespace
    }
    spec = {
      type     = "NodePort"
      externalTrafficPolicy = "Cluster"
      selector = { app = "driver-duo" }
      ports    = [{ port = 3000, targetPort = 3000, nodePort = 30080 }]
    }
  }

  depends_on = [kubernetes_manifest.namespace]
}

output "app_node_port" {
  description = "NodePort used to access the application."
  value       = 30080
}

output "app_public_url" {
  description = "Public URL when node_public_ip is supplied."
  value       = var.node_public_ip == null ? null : "http://${var.node_public_ip}:30080"
}