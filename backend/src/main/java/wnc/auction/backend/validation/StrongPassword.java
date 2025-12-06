package wnc.auction.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface StrongPassword {

    String message() default
            "Password must be at least 8 characters long, contain at least one digit, one lowercase letter, one uppercase letter, and one special character";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
