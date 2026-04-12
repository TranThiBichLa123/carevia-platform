package com.carevia.service.helper;


/**
 * Interface for generating unique codes for specific entity types
 * such as Client, Staff, etc.
 */
public interface CodeGenerator {

    /**
     * Generates a unique code for an entity.
     *
     * @return a unique code string
     */
    String generate();
}
