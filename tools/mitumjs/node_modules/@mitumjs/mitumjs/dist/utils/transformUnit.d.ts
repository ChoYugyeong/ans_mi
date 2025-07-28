export declare class Utils {
    /**
     * The decimal number used in the base currency. (default value is 9.)
     *
     * Can be modified to user-specified value using the **setDecimal()** method.
     */
    decimal: number;
    constructor(decimal?: number);
    /**
     * Sets the decimal value used for unit conversions.
     * @param {number} decimal - The decimal places to be used, input integer must equal or greater than 0.
     */
    setDecimal(decimal: number): void;
    /**
     * Validates if a string can be converted to a BigInt.
     * @param {string} value - The value to be validated.
     * @returns {boolean} - True if valid, false otherwise.
     */
    private isValidBigIntString;
    /**
     * Validates if a string is a valid decimal number.
     * @param {string} value - The value to be validated.
     * @returns {boolean} - True if valid, false otherwise.
     */
    private isValidDecimalString;
    /**
     * Converts integer string *value* into a "decimal string", assuming decimal places.
     * The `decimal` number can be set with `setDecimal()` and the default value is 9.
     * @param {string} value - Integer in string type.
     * @returns {string} - Value expressed in minimum units.
     * @example
     * // Example: Convert PAGE to FACT (decimal: 9)
     * const value = "20000000000"; //PAGE
     * const result = mitum.utils.formatUnits(value);
     * console.log(`PAGE to FACT: ${result}`); // "20.0"
     */
    formatUnits(value: string): string;
    /**
     * Converts the "decimal string" *value* to a integer string, assuming decimal places.
     * The `decimal` number can be set with `setDecimal()` and the default value is 9.
     * @param {string} value - Decimal number in string type.
     * @returns {string} - Value expressed in basis units.
     * @example
     * // Example: Convert FACT to PAGE (decimal: 9)
     * const value = "12.12345"; //FACT
     * const result = mitum.utils.parseUnits(value);
     * console.log(`FACT to PAGE: ${result}`); // "12123450000"
     */
    parseUnits(value: string): string;
}
