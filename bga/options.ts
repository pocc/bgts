import { BGANums as PropNums } from '../index';

export const modesJSON: PropNums = {
    "normal": 0,
    "training": 1
}
export const speedsJSON: PropNums = {
    "fast": 0,
    "normal": 1,
    "slow": 2,
    "24/day": 10,
    "12/day": 11,
    "8/day": 12,
    "4/day": 13,
    "3/day": 14,
    "2/day": 15,
    "1/day": 17,
    "1/2days": 19,
    "nolimit": 20,
}
export const karmasJSON: PropNums = {"0": 0, "50": 1, "65": 2, "75": 3, "85": 4}
export const levels: Array<String> = [
    "beginner",
    "apprentice",
    "average",
    "good",
    "strong",
    "expert",
    "master",
]