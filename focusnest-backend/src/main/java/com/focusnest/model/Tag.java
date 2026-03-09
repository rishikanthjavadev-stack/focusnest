package com.focusnest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tags")
public class Tag {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public Tag() {}
    public Tag(String name) { this.name = name; }

    public Long   getId()   { return id; }
    public String getName() { return name; }
    public void   setId(Long v)     { id = v; }
    public void   setName(String v) { name = v; }
}
