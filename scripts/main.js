const app = Vue.createApp({
    data(){
        return{
            listMembers: [],
            listParty: ["R", "D", "ID"],
            listState: "",
            listMembersPCT: [],
            atGlance:{
                democrats: [],
                republicans: [],
                independents: []
            },
            avoregeGlance: {
                democrats: [],
                republicans: [],
                independents: []
            },
            avoregeTotal: [],
            avoregeTotalInd: [],
            leastEngaged: [],
            mostEngaged: [],
            leastLoyalty: [],
            mostLoyalty: []
        }
    },
    created(){
        let documentURL = window.location.pathname.split("/").pop()
        let chamber = ""

        if(documentURL === "house_congress.html" || documentURL === "house_attendance.html" || documentURL === "house_loyalty.html"){
            chamber = "house"
        }else if(documentURL === "senate_congress.html" || documentURL === "senate_attendance.html" || documentURL === "senate_loyalty.html"){
            chamber = "senate"
        }

        let urlChamber = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`
        let initChamber = {
            headers: {
                "X-API-Key": "Vh3Y4EUEQh9dn7B6cm2PkmxNsIyCxgHdHiQPv4lU"
            }
        }

        fetch(urlChamber, initChamber)
            .then(response => response.json())
            .then(dataMembers => {
                this.listMembers = dataMembers.results[0].members
                this.filterParty(this.listMembers)

                this.avoregeGlance.democrats = this.avoregeVotes(this.atGlance.democrats)
                this.avoregeGlance.republicans = this.avoregeVotes(this.atGlance.republicans)
                this.avoregeGlance.independents = this.avoregeVotes(this.atGlance.independents)

                this.avoregeTotal = ((this.atGlance.democrats.length * this.avoregeGlance.democrats + this.atGlance.republicans.length * this.avoregeGlance.republicans + this.atGlance.independents.length * this.avoregeGlance.independents) / this.listMembers.length).toFixed(2)

                this.avoregeTotalInd = ((this.atGlance.democrats.length * this.avoregeGlance.democrats + this.atGlance.republicans.length * this.avoregeGlance.republicans) / this.listMembers.length).toFixed(2)

                this.listMembersPCT = Math.round(this.listMembers.length * 0.1)

                this.votesAbsolute(this.listMembers)

                this.leastEngaged = this.orderVotes(this.listMembers, "UP", "missed_votes_pct")
                this.mostEngaged = this.orderVotes(this.listMembers, "DOWN", "missed_votes_pct")

                this.leastLoyalty = this.orderVotes(this.listMembers, "DOWN", "votes_with_party_pct")
                this.mostLoyalty = this.orderVotes(this.listMembers, "UP", "votes_with_party_pct")
            })
            .catch(error => console.log(error.message))
        },
    methods:{
        filterParty(array){
            this.atGlance.democrats = array.filter(member => member.party === "D")
            this.atGlance.republicans = array.filter(member => member.party === "R")
            this.atGlance.independents = array.filter(member => member.party === "ID")
        },

        avoregeVotes(array){
            let operator = 0
            for(i = 0; i < array.length; i++){
                operator += array[i].votes_with_party_pct
            }
            pctVotes = (operator / array.length).toFixed(2)
            return pctVotes
        },

        votesAbsolute(array){
            array.forEach(member => {
                let memberVotes = Math.round((member.total_votes - member.missed_votes) * (member.votes_with_party_pct / 100))
                member["votes_absolute"] = memberVotes
            })
        },

        orderVotes(array, order, property){
            if(order === "DOWN"){
                return array.filter(member => member.total_votes > 0)
                .sort((a, b) => {
                    if(a[property] == b[property]){
                        return 0
                    }if(a[property] < b[property]){
                        return -1
                    }
                    return 1
                })
                .splice(0, this.listMembersPCT) 
            }
            if(order === "UP"){
                return array.filter(member => member.total_votes > 0)
                .sort((a, b) => {
                    if(a[property] == b[property]){
                        return 0
                    }
                    if(a[property] > b[property]){
                        return -1
                    }
                    return 1
                })
                .splice(0, this.listMembersPCT)
            }
        }
    },
    computed:{
        filterMembers(){
            if(this.listState === ""){
                return this.listMembers.filter(member => this.listParty.includes(member.party))
            }else{
                return this.listMembers.filter(member => this.listParty.includes(member.party) && member.state === this.listState)
            } 
        },
    },
})

app.mount("#app")