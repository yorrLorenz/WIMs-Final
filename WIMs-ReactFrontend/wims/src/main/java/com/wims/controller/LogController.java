package com.wims.controller;
import com.wims.model.Log;

import com.wims.repository.LogRepository;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "https://wims-beta.vercel.app", allowCredentials = "true")
public class LogController {

    private final LogRepository logRepository;

    public LogController(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Log>> getLogsByGroupId(@PathVariable String groupId) {
        List<Log> logs = logRepository.findByGroupIdOrderByDateTimeDesc(groupId);
        return ResponseEntity.ok(logs);
    }
}

