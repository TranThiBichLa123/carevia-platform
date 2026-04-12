package com.carevia.core.domain;

import com.carevia.shared.constant.Gender;

import java.time.LocalDate;

public interface BaseProfile {
    String getFullName();
    Gender getGender();
    String getBio();
    LocalDate getBirthDate();
}

