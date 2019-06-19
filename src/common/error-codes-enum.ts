export enum ErrorCode {
        // -------------------------- SYSTEM ERROR CODES---------------------------
        /**
         * Error Code: Indicates that the given ErrorCode was not registered in this list. Defaults to unknown.
         */
        UNKNOWN_ERROR = 9999,
        /**
         * Error Code: Indicates that an (general) unexpected error has occurred during system processing. Corresponds to an
         * HTTP response status 500 - Internal Server Error.
         */
        UNEXPECTED_ERROR = 7000,
        /**
         * Error Code: Indicates that the properties file could not be loaded. Corresponds to an HTTP response status 500 -
         * Internal Server Error.
         */
        CONFIGURATION_ERROR = 7001,
        /**
         * Error Code: Indicates that a database error occurred. Corresponds to an HTTP response status 500 - Internal
         * Server Error.
         */
        DATABASE_ERROR = 7002,
        /**
         * Error Code: Indicates that an error occurred while calling an external service. Corresponds to an HTTP response
         * status 500 - Internal Server Error.
         */
        EXTERNAL_SERVICE_ERROR = 7003,
        /**
         * Error Code: Indicated that an error occurred while retrieving configuration data from configuration table(s).
         * Corresponds to an HTTP response status 500 - Internal Server Error.
         */
        DATABASE_CONFIGURATION_ERROR = 7004,
        /**
         * Error Code: Indicated that an error occurred while parsing and XML or JSON string, or converting an object into
         * string. Corresponds to an HTTP response status 500 - Internal Server Error.
         */
        MARSHALLING_ERROR = 7005,
        CONNECTION_ERROR = 7006,
        // ------------------------------------------------------------------------
        // -------------------------- SERVICE ERROR CODES--------------------------
        /**
         * Error Code: Indicates that an error occurred while parsing the body of an HTTP request. Corresponds to an HTTP
         * response status 400 - Bad Request.
         */
        INVALID_REQUEST = 7100,
        /**
         * Error Code: Indicates that the request message sent to this service contains an argument that does not meet the
         * requirements of the service contract. Corresponds to an HTTP response status 400 - Bad Request.
         */
        REQUIRED_ARG = 7101,
        /**
         * Error Code: Indicates that the request message sent to this service contains an argument that does not meet data
         * format constraints of the service contract. Corresponds to an HTTP response status 400 - Bad Request.
         */
        INVALID_ARG = 7102,
        // ------------------------------------------------------------------------
        // ------------------------- BUSINESS ERROR CODES--------------------------
        /**
         * Error Code: Indicates that the request failed to pass business validation rules. Corresponds to an HTTP response
         * status 409 - Conflict
         */
        VALIDATION_ERROR = 7500,
        /**
         * Error Code: Indicates that the request attempted to manipulate an entity that does not exist and therefore cannot
         * be manipulated. Corresponds to an HTTP response status 404 - Not Found
         */
        NOT_FOUND = 7501,
        /**
         * Error Code: Indicates that the request failed security authorization. Corresponds to an HTTP response status 401
         * - Unauthorized.
         */
        SECURITY_ERROR = 7502,
        /**
         * Error Code: Indicates that a request object attempted to reference an entity by its ID, and the entity with that
         * ID does not exist. Corresponds to an HTTP response status 409 - Conflict
         */
        INVALID_REF_ID = 7503,
        /**
         * Error Code: Indicates that an entity contained in a request is missing a value for a required field. Corresponds
         * to an HTTP response status 409 - Conflict
         */
        REQUIRED_FIELD = 7504,
        /**
         * Error Code: Indicates that an entity contained in a request has a field value that does not pass business logic
         * validation. Corresponds to an HTTP response status 409 - Conflict
         */
        INVALID_FIELD = 7505,
        // ------------------------------------------------------------------------
        // ------------------------ BUSINESS WARNING CODES-------------------------
        /**
         * Warning Code: Indicates that the request succeeded but warnings accompany the result. Corresponds to an HTTP
         * response status 200 - OK.
         */
        GENERAL_WARNING = 7800,

        SLOT_UNAVAILABLE = 6000,
        RP_RESOURCE_KEY_ERROR = 6011,
        SLOTS_UNAVAILABLE_DUE_TO_RESTRICTION = 6050,
        APP_ERROR = 9000,
        DB_ERROR = 9001,
        DIP_RP_SERVICE_ERROR = 9002,
        JAXB_ERROR = 9003,
        DATA_ERROR = 9005,
        INVALID_REQUEST_DATA_ERROR = 9007,
        NOT_ELIGIBLE_FOR_FLYBY = 9008,
        DIP_RP_SERVICE_FAILURE_RESPONSE_ERROR = 9009, // RP down
        DIP_RP_SERVICE_ROUTE_NOT_FOUND_ERROR = 9010,
        NO_SLOTS_ERROR_CD = 9011,
        INVALID_TRUCK_TYPE_ERROR = 9012,
        NON_EXISTING_STORE = 9013,
        DIP_INVENTORY_NOT_AVAILABLE = 9014,
        DIP_RP_QUICK_CAPACITY_REQUEST_NOSLOTS = 9015,
        RP_TIME_OUT = 9016,
        DIP_RP_CAPACITY_REQUEST_ERROR = 9017,
        RP_SERVICE_CONNECT_TIME_OUT = 9018,
        RP_EMPTY_RESPONSE = 9019,
        DEDICATED_READ_TIME_OUT = 9020,
        DEDICATED_CONNECT_TIME_OUT = 9021,
        COMMINGLE_READ_TIME_OUT = 9022,
        COMMINGLE_CONNECT_TIME_OUT = 9023,
        PAST_START_DATE_WARNING = 9508,

        TOO_MANY_REQUEST = 429,
    }