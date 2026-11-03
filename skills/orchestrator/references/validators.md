# Validateurs par type de sortie

Prends la première ligne qui correspond. Si les fichiers modifiés touchent l'authentification, des entrées utilisateur, des paiements, des secrets ou des requêtes SQL, ajoute toujours `security-reviewer`.

| Fichiers modifiés ou sortie | Validateur |
|---|---|
| `*.py` (Django inclus) | `python-reviewer` |
| `*.ts`, `*.tsx`, `*.js`, `*.jsx` | `typescript-reviewer` |
| `*.go` | `go-reviewer` |
| `*.rs` | `rust-reviewer` |
| `*.dart` | `flutter-reviewer` |
| `*.java` | `java-reviewer` |
| `*.kt` | `kotlin-reviewer` |
| `*.cpp`, `*.h` | `cpp-reviewer` |
| Migrations, `*.sql`, schéma | `database-reviewer` |
| Contenu SEO (`seo/*.md`, articles) | `seo-relecteur-eeat` |
| Titles, meta, structure Hn | `seo-structure-hn` |
| Résultats de tests E2E | `e2e-runner` |
| Plusieurs langages, ou aucun ci-dessus | `code-reviewer` |

Le validateur reçoit :

- l'objectif et les critères d'acceptation de l'étape 1 ;
- la `response` d'agy ;
- le `git diff` réel.

Il retourne un verdict APPROVE, WARNING ou BLOCK et des constats classés CRITICAL, HIGH, MEDIUM ou LOW.
