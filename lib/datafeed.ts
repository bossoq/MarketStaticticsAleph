export interface QueryLastAvailable {
    type: string
}

export interface QueryAvgMktReturns {
    indicator: string,
    year: number,
    month: string,
    interval: number
}

export interface QueryAllReturnsDefault {
    indicator: string,
    asof: string,
}

export interface QueryBondYield {
    asof: string
}

export interface LastAvailable {
    startMonth: string,
    startYear: number,
    endMonth: string,
    endYear: number
}
