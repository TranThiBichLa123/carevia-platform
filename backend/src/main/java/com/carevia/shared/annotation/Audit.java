package com.carevia.shared.annotation;

import com.carevia.shared.constant.AuditAction;
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Audit {
    String table();
    AuditAction action();
}
