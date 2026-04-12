package com.carevia.service.event;

import com.carevia.core.domain.Account;
import com.carevia.shared.constant.AccountActionType;

public record AccountStatusChangeEvent (
     Account account,
     AccountActionType actionType,
     String reason
){}
