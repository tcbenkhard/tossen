export const getEnvironmentVariable = (name: string, defaultValue?: string): string => {
    const value = process.env[name];
    if(!value && !defaultValue)
        throw new Error(`Environment variable '${name}' is not defined or has no value!`);

    return value || defaultValue!;
}