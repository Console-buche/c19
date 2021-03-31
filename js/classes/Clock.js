/*
DISCLAIMER : some of the code below is going to hurt your eyes badly. I mean it. This was coded in 3 days and a lot of cups of coffee, to take part in Devpost Facebook Hackathon.
If, however, you're interested in the tech/concept, don't be that guy and contact me before copying/pasting :)

Stay safe, 
Sebastien Dubourg
*/
export default class Clock {

    constructor() {
        this.days = 0;
        this.hours = 5;
        this.minutes = 0
        this.simIsOn = false;
        this.sky = null;
        this.nightTime = true;
        this.light = null;
        this.lightAngle = 0;
        this.sunCycle = -1;
    }

    update() {
        //gestion temps
        if (this.simIsOn) {
            this.minutes += 0.75;
            if (this.minutes >= 60) {
                this.hours++;
                this.minutes = 0;
                let container = document.getElementById("hours");
                container.textContent = this.hours;
                if (this.hours >= 23) {
                    this.days++;
                    this.hours = 0;
                    let container = document.getElementById("days");
                    container.textContent = this.days;
                }
            }
            let container = document.getElementById("mins");
            container.textContent = Math.floor(this.minutes);

            var lastSunPos = this.nightTime;
            //explicity say whether it's nighttime or not
            if (this.hours > 22 || this.hours < 5) {
                this.nightTime = true;
            } else {
                this.nightTime = false;
            }

            if (this.nightTime !== lastSunPos) {
                this.updateSky();
            }
        }
    }

    startClock() {
        this.simIsOn = true;
    }

    updateSky() {
        if (this.sky !== null) {
            var coords = {
                t: 0,
                x: this.sky.rotation.x,
                lightPosX: this.light.position.x,
                lightPosY: this.light.position.y
            };
            var tween = new TWEEN.Tween(coords)
                .to({
                    x: coords.x + Math.PI,
                    lightPosY: coords.lightPosY * -1
                }, 5000)
                .onUpdate(() => {
                    this.sky.rotation.x = coords.x;
                    this.light.position.y = coords.lightPosY;
                })
                .easing(TWEEN.Easing.Elastic.InOut)
                .start();
        }
    }
}