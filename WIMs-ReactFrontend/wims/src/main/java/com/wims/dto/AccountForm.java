package com.wims.dto;

public class AccountForm {
    private String username;
    private String password;
    private String role;       // "ADMIN" or "CLERK"
    private String warehouse;  // Only used if role is "CLERK"

    // --- Getters and Setters ---

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(String warehouse) {
        this.warehouse = warehouse;
    }

    @Override
    public String toString() {
        return "AccountForm{" +
               "username='" + username + '\'' +
               ", role='" + role + '\'' +
               ", warehouse='" + warehouse + '\'' +
               '}';
    }
}
