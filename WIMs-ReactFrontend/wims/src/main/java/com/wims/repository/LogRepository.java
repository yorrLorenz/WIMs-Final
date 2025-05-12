package com.wims.repository;

import com.wims.model.Log;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {
    List<Log> findByWarehouseOrderByDateTimeDesc(String warehouse);
    List<Log> findByWarehouseAndDateTimeBetweenOrderByDateTimeDesc(
        String warehouse, LocalDateTime start, LocalDateTime end);
    List<Log> findByGroupIdOrderByDateTimeDesc(String groupId);
    List<Log> findAllByOrderByDateTimeDesc();

    // For Admin logs with date filter (all warehouses)
    List<Log> findByDateTimeBetweenOrderByDateTimeDesc(
        LocalDateTime start, LocalDateTime end
    );
    List<Log> findByUsernameOrderByDateTimeDesc(String username);
    long countByWarehouseAndDateTimeBetween(String warehouse, LocalDateTime start, LocalDateTime end);
    List<Log> findByGroupId(String groupId);
   int countByGroupIdStartingWith(String prefix);



}
    
