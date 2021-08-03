import "https://deno.land/x/xhr@0.1.2/mod.ts";
import { createClient } from "supabase-js";

// interface
import type { SETReturn, BondYield } from "~/lib/dbtypes.ts"
import type { QueryLastAvailable, QueryAvgMktReturns, QueryAllReturnsDefault, LastAvailable } from "~/lib/datafeed.ts"

export default class QueryDB {
    supabase

    constructor(SUPABASEURL: string, SUPABASEAPI: string) {
        this.supabase = createClient(SUPABASEURL, SUPABASEAPI);
    }
    capitalize = (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    initSETData = async (): Promise<SETReturn[]> => {
        const { data } = await this.supabase.from<SETReturn>("SET_Return").select("id,year,month")
        const allSETRecordsObj: SETReturn[] = Object.assign(data || [])
        return allSETRecordsObj
    }
    selectMissing = (type: string): number =>{
        if (type === "yearly") {
            return this.yearlyMissing    
        } else if (type === "monthly") {
            return this.monthlyMissing
        } else {
            console.log("errortype")
            return this.yearlyMissing
        }
    }
    defaultInterval: number[] = [
        1,
        3,
        5,
        10,
        17,
        19,
        20,
        25,
        30,
        35,
        40,
        42
    ]
    monthString: string[] = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ]
    yearlyMissing = 12
    monthlyMissing = 1
    // allSETRecordsObj: SETReturn[] = await this.initSETData()
    averageMktReturns = async (query: QueryAvgMktReturns): Promise<{ [k: string]: number }> => {
        const allSETRecordsObj: SETReturn[] = await this.initSETData()
        const lastSETRecordsObj: SETReturn = allSETRecordsObj.find(records => records.month === query.month && records.year === query.year) || {id: 0}
        const periodId: number = lastSETRecordsObj.id
        const indicator: string = `${query.indicator}_return,${query.indicator}_tri`
        const missingValue = this.selectMissing(query.indicator)
        const maxInterval = Math.min(periodId - missingValue, query.interval * 12)
        const offset = Math.max(periodId - query.interval * 12, missingValue)
        const { data } = await this.supabase.from<SETReturn>("SET_Return").select(indicator).range(offset, periodId)
        const allReturnObj: [] = Object.assign(data || [])
        let dataset_return = 0
        let dataset_tri = 0
        for(let i = 0; i < maxInterval; i++){
            dataset_return += allReturnObj[i][`${query.indicator}_return`]
            dataset_tri += allReturnObj[i][`${query.indicator}_tri`]
        }
        const average_return: number = dataset_return / maxInterval
        const average_tri: number = dataset_tri / maxInterval
        const div_yield: number = average_tri - average_return
        const retKey: string = `${this.capitalize(query.indicator)} Return`
        const triKey: string = `${this.capitalize(query.indicator)} Tri`
        const divKey: string = "Dividend Yield"
        const retObj = {
            Period: query.interval,
            [retKey]: average_return,
            [divKey]: div_yield,
            [triKey]: average_tri
        }
        return retObj
    }
    bondYieldReturn = async (asof: string): Promise<BondYield> => {
        const asofString = asof.slice(0, 10)
        const { data } = await this.supabase.from<BondYield>("Bond_Yield").select("*").match({asof: asofString})
        const bondYieldObjects: BondYield[] = Object.assign(data || [])
        return bondYieldObjects[0]
    }
    allBondDate = async (): Promise<Date[]> => {
        const { data } = await this.supabase.from<{ asof: Date }>("Bond_Yield").select("asof")
        const dataObj: { asof: Date }[] = Object.assign(data || [])
        const records: Date [] = dataObj.map(({ asof }: { asof: Date }) => { return asof })
        return records
    }
    getLastAvailable = async (type: QueryLastAvailable): Promise<LastAvailable> => {
        const missing: number = this.selectMissing(type.type) || this.yearlyMissing
        const allSETRecordsObj: SETReturn[] = await this.initSETData()
        const lastSETRecordsObj: SETReturn = allSETRecordsObj.slice(-1).pop() || {id: 0, year: 0, month: "", yearly_return: 0, monthly_return: 0, yearly_tri: 0, monthly_tri: 0}
        const endYear: number = lastSETRecordsObj.year || 0
        const endMonth: string = lastSETRecordsObj.month || ""
        
        const shiftYear: number = Math.floor((allSETRecordsObj.length - missing) / 12)
        const shiftMonth: number = (allSETRecordsObj.length - missing) % 12
        const startYear: number = endYear - shiftYear
    
        let index: number = this.monthString.findIndex(month => month === endMonth)
        index -= shiftMonth
        if(index < 0){
            index += this.monthString.length
        }
        const startMonth: string = this.monthString[index]
        
        const data: LastAvailable = {
            startMonth,
            startYear,
            endMonth,
            endYear
        }
        return data
    }
    allReturnsDefault = async (query: QueryAllReturnsDefault): Promise<{ [k: string]: number }[]> => {
        const lastReturnAvailable: LastAvailable = await this.getLastAvailable({ type: query.indicator })
        const asofDate = new Date(query.asof)
        const year: number = asofDate.getFullYear()
        const month: string = this.monthString[asofDate.getMonth()]
        let endYear = year
        let endMonth = month
        if (year > lastReturnAvailable.endYear) {
            endYear = lastReturnAvailable.endYear
            endMonth = lastReturnAvailable.endMonth
        } else if (year === lastReturnAvailable.endYear) {
            const monthIndex = this.monthString.indexOf(month)
            const lastReturnAvailableIndex = this.monthString.indexOf(lastReturnAvailable.endMonth)
            if (monthIndex > lastReturnAvailableIndex) {
                endMonth = lastReturnAvailable.endMonth
            }
        }
        const queryPrep = {
            indicator: query.indicator,
            year: endYear,
            month: endMonth
        }
        const bondYield = await this.bondYieldReturn(`${String(asofDate.getFullYear())}-${String(asofDate.getMonth() + 1).padStart(2, '0')}-${String(asofDate.getDate()).padStart(2, '0')}`)
        const bondYieldHead = "Bond Yield"
        const bondYieldObj = Object.assign(bondYield)
        let ret: { [k: string]: number }[] = []
        for (const interval of this.defaultInterval) {
            const querySend = Object.assign(queryPrep, {interval: interval})
            let mktReturns = await this.averageMktReturns(querySend)
            const bondSlice: string = `${mktReturns.Period}Y`
            const bondYieldSingle = {
                [bondYieldHead]: bondYieldObj[bondSlice]
            }
            mktReturns = {...mktReturns, ...bondYieldSingle}
            ret.push(mktReturns)
        }
        return ret
    }
}










