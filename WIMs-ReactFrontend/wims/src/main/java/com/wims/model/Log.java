package com.wims.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Entity
@Table(name = "logs")
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_time")
    private LocalDateTime dateTime;

    @Column(name = "username")
    private String username;

    @Column(name = "action")
    private String action;

    @Column(name = "item")
    private String item;

    @Column(name = "warehouse")
    private String warehouse;

    @Column(name = "location")
    private String location;

    @Column(name = "group_id")
    private String groupId;

    // 🔽 Not stored in DB, used for Thymeleaf to display related logs
    @Transient
    private List<Log> relatedLogs;

    // --- Constructors ---

    @PrePersist
    public void generateGroupIdIfRestocked() {
        if ("Restocked".equalsIgnoreCase(action) && (groupId == null || groupId.isBlank())) {
            this.groupId = UUID.randomUUID().toString();
        }
    }

    public Log() {}

    public Log(LocalDateTime dateTime, String username, String action, String item, String warehouse, String location) {
        this.dateTime = dateTime;
        this.username = username;
        this.action = action;
        this.item = item;
        this.warehouse = warehouse;
        this.location = location;
    }

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public String getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(String warehouse) {
        this.warehouse = warehouse;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public List<Log> getRelatedLogs() {
        return relatedLogs;
    }

    public void setRelatedLogs(List<Log> relatedLogs) {
        this.relatedLogs = relatedLogs;
    }
}
