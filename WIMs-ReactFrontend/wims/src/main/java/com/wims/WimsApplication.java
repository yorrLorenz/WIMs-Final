package com.wims;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.wims.model.User;
import com.wims.repository.UserRepository;
import com.wims.repository.WarehouseRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class WimsApplication {
    public static void main(String[] args) {
        SpringApplication.run(WimsApplication.class, args);
    }

    @Bean
CommandLineRunner run(UserRepository userRepository, PasswordEncoder encoder, WarehouseRepository warehouseRepo) {
    return args -> {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setWarehouse("Global");
            admin.setImageUrl(""); 
            userRepository.save(admin);
        }
    };
}

}
