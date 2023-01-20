export class Cell{
    constructor(val){
        this.collapsed = false;

        if(val instanceof Array){
            this.options = val;
        }else{
            this.options = [];
            for(let i = 0; i < val; ++i){
                this.options[i] = i;
            }
        }
    }
}