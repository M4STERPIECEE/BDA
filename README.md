# BDA

Projet backend Spring Boot pour gérer des **étudiants**, des **notes** et un **journal d’audit**.

## Architecture du projet

Le backend suit une architecture simple en couches :

- **Controller** : expose les routes HTTP et valide les entrées.
- **Service** : contient la logique métier.
- **Repository** : accède à la base de données via Spring Data JPA.
- **Model / Entity** : représente les tables PostgreSQL.
- **DTO** : transporte les données entre l’API et le client.
- **Exception** : centralise les erreurs métier et la réponse HTTP.

### Flux d’une requête

`Controller` → `Service` → `Repository` → `Database`

Le retour suit le chemin inverse avec des DTO de réponse.

## Principales annotations utilisées

### Spring Web

- `@RestController` : déclare une API REST. À utiliser sur une classe qui retourne du JSON.
- `@RequestMapping` : définit le préfixe d’URL d’un contrôleur.
- `@GetMapping` / `@PostMapping` / `@PutMapping` / `@DeleteMapping` : mappe une méthode à une route HTTP.
- `@PathVariable` : récupère une valeur dans l’URL.
- `@RequestBody` : récupère le corps JSON de la requête.
- `@ResponseStatus` : fixe un code HTTP pour une exception.
- `@RestControllerAdvice` : gère les exceptions globalement pour toutes les routes.

### Spring Service / Transaction

- `@Service` : marque une classe contenant la logique métier.
- `@Transactional` : ouvre une transaction de base de données.
  - `readOnly = true` pour les lectures.
  - sans `readOnly` pour les écritures (`create`, `update`, `delete`).

### Spring Data JPA

- `@Entity` : classe persistée en base.
- `@Table` : nom de la table associée.
- `@Id` : clé primaire.
- `@GeneratedValue` : génération automatique de l’identifiant.
- `@Column` : précise le nom et les contraintes d’une colonne.
- `@Embeddable` / `@EmbeddedId` : clé composite.
- `@MapsId` : relie une clé composite à une relation JPA.
- `@ManyToOne(fetch = FetchType.LAZY)` : relation plusieurs-vers-un chargée à la demande.

### Validation

- `@Valid` : déclenche la validation d’un objet d’entrée.
- `@NotNull` : valeur obligatoire.
- `@NotBlank` : chaîne obligatoire et non vide.
- `@Size` : limite la taille d’une chaîne.
- `@DecimalMin` / `@DecimalMax` : borne une valeur numérique.

### Lombok

- `@Getter` / `@Setter` : génère les accesseurs.
- `@NoArgsConstructor` / `@AllArgsConstructor` : génère les constructeurs.
- `@Builder` : permet de construire l’objet en mode fluent.
- `@RequiredArgsConstructor` : génère un constructeur pour les champs `final`.
- `@EqualsAndHashCode` : génère `equals()` et `hashCode()`.
- `@Slf4j` : ajoute un logger prêt à l’emploi.

### Swagger / OpenAPI

- `@Tag` : groupe un ensemble de routes.
- `@Operation` : décrit une action.
- `@ApiResponses` / `@ApiResponse` : documente les réponses HTTP.
- `@Schema` / `@Content` / `@ArraySchema` : décrit le format des DTO dans la documentation.

### Quand utiliser un `record`

Un `record` est adapté pour les DTO immuables :

- requêtes (`StudentRequest`, `GradeRequest`, `SubjectRequest`)
- réponses (`StudentResponse`, `GradeResponse`, `AuditResponse`, `AuditStatsResponse`)

On évite le `record` pour les entités JPA, car Hibernate a besoin de classes mutables avec un constructeur sans argument.

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

Par défaut, l’application utilise :

- `http://localhost:8080/api`
- Swagger UI : `http://localhost:8080/api/swagger-ui.html`
- OpenAPI JSON/YAML : `http://localhost:8080/api/v3/api-docs`

## Base de données

Les migrations SQL se trouvent dans :

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

