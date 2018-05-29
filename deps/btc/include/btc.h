#ifdef __cplusplus
extern "C" {
#endif

#ifndef BTC_H_
#define BTC_H_

/**
 * Positive status
 */
#define BTC_OK 1
/**
 * Unexpected end of stream
 */
#define BTC_UNEXPECTED_END -2
/**
 * Found unexpected token value / type
 */
#define BTC_UNEXPECTED_TOKEN -3
/**
 * There is no token available for consuming
 */
#define BTC_NO_TOKEN -4

/**
 * Assert status as BTC_OK or return status
 */
#define BTC_CHECK_STATUS(status)\
    if(status != BTC_OK)\
        return status;


#define BTC_CHECK_STATUS_VOID(status) \
    if(status != Ok)\
        return;

#include "../src/tokenizer.h"
#include "../src/parser.h"

#endif

#ifdef __cplusplus
}
#endif