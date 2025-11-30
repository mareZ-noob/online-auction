package wnc.auction.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    @Override
    public void initialize(StrongPassword constraintAnnotation) {
        // Initialization logic if needed
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }

        // Define the regex pattern for a strong password
        // ^                 : start of string
        // (?=.*\\d)         : at least one digit
        // (?=.*[a-z])       : at least one lowercase letter
        // (?=.*[A-Z])       : at least one uppercase letter
        // (?=.*[@#$%^&+=!]) : at least one special character
        // (?=\S+$)          : no whitespace allowed
        // .{8,}             : at least 8 characters
        // $                 : end of string
        String passwordPattern = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";

        return password.matches(passwordPattern);
    }
}