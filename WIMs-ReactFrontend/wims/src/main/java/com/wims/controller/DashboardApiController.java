package com.wims.controller;

import com.wims.dto.DashboardLogDTO;
import com.wims.dto.DashboardResponseDTO;
import com.wims.model.Log;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.ProductRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DashboardApiController {

    private final WarehouseRepository warehouseRepository;
    private final LogRepository logRepository;
    private final ProductRepository productRepository;

    public DashboardApiController(
            WarehouseRepository warehouseRepository,
            LogRepository logRepository,
            ProductRepository productRepository) {
        this.warehouseRepository = warehouseRepository;
        this.logRepository = logRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/dashboard-by-date")
public DashboardResponseDTO getLogsByDateForWarehouse(
        @RequestParam("date") String date,
        @RequestParam("warehouse") String warehouse
) {
    LocalDate parsedDate = LocalDate.parse(date);

 
    ZoneId zone = ZoneId.of("Asia/Manila");
    Instant start = parsedDate.atStartOfDay(zone).toInstant();
    Instant end = parsedDate.atTime(23, 59, 59).atZone(zone).toInstant();

    List<Log> logs = logRepository.findByWarehouseAndDateTimeBetweenOrderByDateTimeDesc(
            warehouse, start, end
    );

    List<DashboardLogDTO> logDtos = logs.stream()
            .map(log -> {
                DashboardLogDTO dto = new DashboardLogDTO(
                        log.getId(),
                        log.getDateTime(),
                        log.getUsername(),
                        log.getAction(),
                        log.getItem(),
                        log.getWarehouse(),
                        log.getLocation(),
                        log.getGroupId(),
                        log.getUnits(),
                        log.getRemainingUnits(),
                        log.getPreviousLocation()
                );

                if (log.getGroupId() != null) {
                    List<DashboardLogDTO> relatedLogs = logRepository.findByGroupId(log.getGroupId()).stream()
                            .map(r -> new DashboardLogDTO(
                                    r.getId(),
                                    r.getDateTime(),
                                    r.getUsername(),
                                    r.getAction(),
                                    r.getItem(),
                                    r.getWarehouse(),
                                    r.getLocation(),
                                    r.getGroupId(),
                                    r.getUnits(),
                                    r.getRemainingUnits(),
                                    r.getPreviousLocation()
                            ))
                            .toList();

                    dto.setRelatedLogs(relatedLogs);
                }

                return dto;
            })
            .toList();

    return new DashboardResponseDTO(warehouse, logDtos);
}


    @GetMapping("/dashboard/{warehouseId}")
    public DashboardResponseDTO getDashboardByWarehouse(@PathVariable String warehouseId) {
        Warehouse warehouse = warehouseRepository.findByName(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        List<Log> allLogs = logRepository.findByWarehouseOrderByDateTimeDesc(warehouse.getName());

        List<DashboardLogDTO> dtos = allLogs.stream().map(log -> {
            DashboardLogDTO dto = new DashboardLogDTO(
                    log.getId(),
                    log.getDateTime(),
                    log.getUsername(),
                    log.getAction(),
                    log.getItem(),
                    log.getWarehouse(),
                    log.getLocation(),
                    log.getGroupId(),
                    log.getUnits(),
                    log.getRemainingUnits(),
                    log.getPreviousLocation()
            );

            if (log.getGroupId() != null) {
                List<DashboardLogDTO> related = allLogs.stream()
                        .filter(l -> l.getGroupId() != null && l.getGroupId().equals(log.getGroupId()))
                        .map(l -> new DashboardLogDTO(
                                l.getId(),
                                l.getDateTime(),
                                l.getUsername(),
                                l.getAction(),
                                l.getItem(),
                                l.getWarehouse(),
                                l.getLocation(),
                                l.getGroupId(),
                                l.getUnits(),
                                l.getRemainingUnits(),
                                l.getPreviousLocation()
                        )).collect(Collectors.toList());

                dto.setRelatedLogs(related);
            }

            return dto;
        }).collect(Collectors.toList());

        return new DashboardResponseDTO(warehouse.getName(), dtos);
    }
}
