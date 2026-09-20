import { Chip } from "@mui/material";
const pretty=(value:string)=>value.replaceAll("_"," ").toLowerCase().replace(/\b\w/g,x=>x.toUpperCase());
export default function BookingStatusChip({value}:{value:string}){const color:any=value==='ACCEPTED'||value==='COMPLETED'?'success':value==='REJECTED'?'error':value==='REQUESTED'?'warning':'default';return <Chip size="small" label={pretty(value)} color={color}/>}
