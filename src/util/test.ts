const mapper = <T>  (targetType: T) => {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target['to'+(typeof targetType)] =  (): T => {
            return {
                ...Object.keys(targetType).map(key => target[key])
            } as unknown as T;
        }
    };
}