package com.focusnest.dto.request;

public class UpdateProfileRequest {
    public String name;
    public String currentPassword;
    public String newPassword;

    public String getName()            { return name; }
    public String getCurrentPassword() { return currentPassword; }
    public String getNewPassword()     { return newPassword; }
}
