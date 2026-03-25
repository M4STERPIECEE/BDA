# BDA

Projet BDA pour gérer des **étudiants**/**notes**/**journal d’audit**

## Architecture du projet

Le backend suit une architecture simple en couches :

- **Controller** 
- **Service**
- **Repository** 
- **Model / Entity**
- **DTO**
- **Exception**

## Stack

- Java 25
- Spring Boot
- PostgreSQL
- Springdoc OpenAPI / Swagger UI
- Docker Compose

## Prérequis

- Docker et Docker Compose
- ou, pour un lancement local :
  - Java 25
  - PostgreSQL

## Lancer le projet avec Docker

Depuis la racine du dépôt :

```bash
docker compose up --build
```

Le fichier `docker-compose.yaml` démarre :

- PostgreSQL sur `localhost:5432`
- le backend sur `localhost:8080`

## Lancer le backend en local

Depuis le dossier `backend/` :

```bash
./gradlew bootRun
```

Par défaut, l’app utilise :

- `http://localhost:8080/api`
- Swagger UI : `http://localhost:8080/api/swagger-ui.html`
- OpenAPI JSON/YAML : `http://localhost:8080/api/v3/api-docs`

## Base de données

Migrations SQL se trouvent dans :

- `backend/src/main/resources/db/migration/v1_schema.sql`
- `backend/src/main/resources/db/migration/v2_triggers.sql`

Elles créent les tables principales et les triggers pour :

- recalculer la moyenne d’un étudiant
- enregistrer les opérations sur les notes dans l’audit

## Structure rapide

```text
BDA/
├── docker-compose.yaml
├── backend/
│   ├── build.gradle.kts
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/bda/bda/
│       └── resources/
└── README.md
```

## Remarque

L’API est documentée via Swagger/OpenAPI et versionnée en `v1`.

