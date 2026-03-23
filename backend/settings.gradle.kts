pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

rootProject.name = "bda"

// Le client OpenAPI généré dans `src/main/gen` n'est pas utilisé par le backend
// et peut casser la configuration Gradle selon la version du wrapper.
// On le laisse hors du build principal pour stabiliser `backend`.

