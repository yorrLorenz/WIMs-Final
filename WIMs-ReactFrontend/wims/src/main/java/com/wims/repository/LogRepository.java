package com.wims.repository;

import com.wims.model.Log;
import com.wims.model.Product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {

    List<Log> findByWarehouseOrderByDateTimeDesc(String warehouse);

    List<Log> findByWarehouseAndDateTimeBetweenOrderByDateTimeDesc(
        String warehouse, LocalDateTime start, LocalDateTime end
    );

    List<Log> findByGroupIdOrderByDateTimeDesc(String groupId);

    List<Log> findAllByOrderByDateTimeDesc();

   
    List<Log> findByDateTimeBetweenOrderByDateTimeDesc(LocalDateTime start, LocalDateTime end);

    List<Log> findByUsernameOrderByDateTimeDesc(String username); 

    List<Log> findByUserIdOrderByDateTimeDesc(Long userId); 

    long countByWarehouseAndDateTimeBetween(String warehouse, LocalDateTime start, LocalDateTime end);

    List<Log> findByGroupId(String groupId);
List<Product> findByWarehouse(String warehouse);

    int countByGroupIdStartingWith(String prefix);
}
