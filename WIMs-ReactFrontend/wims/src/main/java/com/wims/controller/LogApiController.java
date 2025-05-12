package com.wims.controller;

import com.wims.model.Log;
import com.wims.repository.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
/* 
@RestController
@RequestMapping("/api/logs")

public class LogApiController {

    @Autowired
    private LogRepository logRepository;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<Log> getLogByGroupId(@PathVariable String groupId) {
        List<Log> logs = logRepository.findByGroupId(groupId);
        if (logs.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(logs.get(0)); // Return one log to autofill
    }

   @PutMapping("/{id}")
public ResponseEntity<?> updateLog(@PathVariable Long id, @RequestBody Log updatedLog) {
    return logRepository.findById(id)
        .map(log -> {
            log.setItem(updatedLog.getItem());
            log.setLocation(updatedLog.getLocation());
            log.setAction(updatedLog.getAction());
            logRepository.save(log);
            return ResponseEntity.ok("Log updated");
        })
        .orElse(ResponseEntity.notFound().build());
}


}
*/