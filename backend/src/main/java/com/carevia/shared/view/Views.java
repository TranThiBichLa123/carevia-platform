package com.carevia.shared.view;

/**
 * Defines JSON serialization views for role-based field visibility.
 */
public class Views {
    public interface Public {}
    public interface Client extends Public {}
    public interface Staff extends Public {}
    public interface Admin extends Public {}
}
