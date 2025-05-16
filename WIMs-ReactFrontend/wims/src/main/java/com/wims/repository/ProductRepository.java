package com.wims.repository;

import com.wims.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByGroupId(String groupId);
    List<Product> findByWarehouse(String warehouse);

}
