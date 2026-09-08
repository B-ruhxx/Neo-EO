package com.neobank.backend.crypto;


import com.neobank.backend.Model.User;
import com.neobank.backend.crypto.CryptoOrder;

import java.math.BigDecimal;

public interface ExchangeGateway {
    CryptoOrder placeMarketOrder(User user,
                                 CryptoOrder.Side side,
                                 String symbol,
                                 BigDecimal quoteAmount,
                                 BigDecimal priceNow);
}
