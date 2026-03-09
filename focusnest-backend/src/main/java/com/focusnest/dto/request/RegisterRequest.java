package com.focusnest.dto.request;
import jakarta.validation.constraints.*;

public class RegisterRequest {
    @NotBlank                                    public String name;
    @Email @NotBlank                             public String email;
    @Size(min = 8, message = "Min 8 characters") public String password;

    public String getName()     { return name; }
    public String getEmail()    { return email; }
    public String getPassword() { return password; }
}
