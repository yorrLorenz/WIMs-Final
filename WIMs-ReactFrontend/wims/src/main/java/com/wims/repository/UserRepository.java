package com.wims.repository;

import com.wims.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // If you want to return Optional<User>:
    Optional<User> findByUsername(String username);
    List<User> findByWarehouse(String warehouseName);

    // — or, if you prefer to throw when not found, return User directly:
    // User findByUsername(String username);
}
