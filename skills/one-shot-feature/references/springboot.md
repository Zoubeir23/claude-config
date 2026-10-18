# SpringBoot Reference

Framework-specific patterns for one-shot-feature implementation.

## SpringBoot — Analysis Checklist

When analyzing a SpringBoot project, look for:

- **Project structure**: Standard Maven/Gradle layout? Package organization?
- **Java vs Kotlin**: Check file extensions and build config
- **Architecture style**: Layered (controller/service/repository) or hexagonal?
- **JPA entities**: How are entities annotated? Base entity class?
- **Repository style**: Spring Data JPA, custom queries, or raw JDBC?
- **DTO pattern**: Separate DTOs or entities exposed directly?
- **Validation**: Bean Validation annotations or custom validators?
- **Exception handling**: `@ControllerAdvice` with `@ExceptionHandler`?
- **Security**: Spring Security? JWT? OAuth2?
- **API style**: REST with `@RestController` or reactive with WebFlux?
- **Database migrations**: Flyway or Liquibase?
- **Testing**: JUnit 5, Mockito, Spring MockMvc, Testcontainers?

## SpringBoot — Implementation Order

Always follow this sequence:

```
Entity → Repository → Service → Controller → Tests
```

Each step explained:

### 1. Entity

```java
// Follow existing entity patterns exactly
// If the project has a BaseEntity with id/createdAt/updatedAt, extend it
// Match annotation style (@Column naming, @Table naming, etc.)

@Entity
@Table(name = "features")
public class Feature extends BaseEntity {  // Reuse base if exists

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Constructors, getters, setters — match project style
    // If project uses Lombok (@Data, @Builder), use Lombok
    // If project writes them out manually, do the same
}
```

If the project uses Flyway or Liquibase, create the migration file too:
```sql
-- Flyway: V{next_version}__create_features_table.sql
CREATE TABLE features (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Repository

```java
// Spring Data JPA — match existing query patterns
// If project uses @Query annotations, follow that style
// If it uses derived query methods, follow that style

@Repository
public interface FeatureRepository extends JpaRepository<Feature, Long> {

    List<Feature> findByUserId(Long userId);

    @Query("SELECT f FROM Feature f WHERE f.name LIKE %:keyword%")
    List<Feature> searchByName(@Param("keyword") String keyword);

    boolean existsByNameAndUserId(String name, Long userId);
}
```

### 3. Service

```java
// Match service layer patterns:
// - Interface + Impl, or just concrete class?
// - Constructor injection or @Autowired?
// - @Transactional at class or method level?

@Service
@RequiredArgsConstructor  // If project uses Lombok
public class FeatureService {

    private final FeatureRepository featureRepository;
    private final UserRepository userRepository;  // Reuse existing repos

    @Transactional
    public Feature createFeature(CreateFeatureRequest request, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If project has a pattern for duplicate checks, follow it
        if (featureRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new DuplicateResourceException("Feature already exists");
        }

        Feature feature = new Feature();
        feature.setName(request.getName());
        feature.setDescription(request.getDescription());
        feature.setUser(user);

        return featureRepository.save(feature);
    }

    public Feature getFeature(Long id) {
        return featureRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Feature not found"));
    }
}
```

### 4. DTOs (if project uses them)

```java
// Request DTO
public record CreateFeatureRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 255)
    String name,

    String description
) {}

// Response DTO
public record FeatureResponse(
    Long id,
    String name,
    String description,
    LocalDateTime createdAt
) {
    public static FeatureResponse from(Feature feature) {
        return new FeatureResponse(
            feature.getId(),
            feature.getName(),
            feature.getDescription(),
            feature.getCreatedAt()
        );
    }
}
```

If the project uses MapStruct or ModelMapper for mapping, follow that pattern instead.

### 5. Controller

```java
// Match existing controller patterns:
// - ResponseEntity vs direct return?
// - Path prefix convention?
// - Swagger/OpenAPI annotations?

@RestController
@RequestMapping("/api/features")  // Match URL convention
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureService featureService;

    @PostMapping
    public ResponseEntity<FeatureResponse> createFeature(
            @Valid @RequestBody CreateFeatureRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Feature feature = featureService.createFeature(request, getUserId(userDetails));
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(FeatureResponse.from(feature));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeatureResponse> getFeature(@PathVariable Long id) {
        Feature feature = featureService.getFeature(id);
        return ResponseEntity.ok(FeatureResponse.from(feature));
    }
}
```

### 6. Tests

```java
// Match testing patterns:
// - @SpringBootTest (integration) vs @WebMvcTest (slice)?
// - Mockito style?
// - Test data setup?

@WebMvcTest(FeatureController.class)
class FeatureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FeatureService featureService;

    @Test
    void createFeature_validRequest_returns201() throws Exception {
        // Arrange
        Feature feature = new Feature();
        feature.setId(1L);
        feature.setName("Test Feature");
        when(featureService.createFeature(any(), any())).thenReturn(feature);

        // Act & Assert
        mockMvc.perform(post("/api/features")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "Test Feature", "description": "A test"}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Test Feature"));
    }

    @Test
    void createFeature_missingName_returns400() throws Exception {
        mockMvc.perform(post("/api/features")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }
}
```

## SpringBoot — Common Patterns to Reuse

| Component | Where to find it | How to reuse |
|-----------|-----------------|--------------|
| BaseEntity | `common/` or `core/` package | Extend: `class Feature extends BaseEntity` |
| Custom exceptions | `exception/` package | Throw the same exception types |
| @ControllerAdvice | `exception/` or `config/` | Already active — just throw matching exceptions |
| Security config | `config/SecurityConfig` | Understand which endpoints need auth |
| Mapper (MapStruct) | `mapper/` package | Create a new `@Mapper` interface |
| Specifications | `specification/` package | Follow pattern for complex queries |
| AOP aspects | `aspect/` package | Understand existing cross-cutting concerns |

## SpringBoot — Validation Patterns

```java
// Bean Validation on DTOs (preferred)
@NotNull @NotBlank @Size @Email @Pattern @Min @Max

// Custom validator
@Constraint(validatedBy = PhoneNumberValidator.class)
@Target({FIELD})
@Retention(RUNTIME)
public @interface ValidPhoneNumber {
    String message() default "Invalid phone number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        return value != null && value.matches("\\+?[0-9]{10,15}");
    }
}
```

## SpringBoot — Error Handling Patterns

Match the project's exception handling. Common patterns:

```java
// If project has @ControllerAdvice, use existing exception types
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
}

// Match the ErrorResponse structure the project already uses
```
