////////////////////////////////////////////////////////////////////////////////////////////////
//       _____ _____  ___   _   __   _   _______ _     ______ _____ _____ _   _  _____        //
//      |_   _/  ___|/ _ \ | | / /  | | / /  _  | |    | ___ \  ___|_   _| \ | |/  ___|       //
//        | | \ `--./ /_\ \| |/ /   | |/ /| | | | |    | |_/ / |__   | | |  \| |\ `--.        //
//        | |  `--. \  _  ||    \   |    \| | | | |    | ___ \  __|  | | | . ` | `--. \       //
//       _| |_/\__/ / | | || |\  \  | |\  \ \_/ / |____| |_/ / |___ _| |_| |\  |/\__/ /       //
//       \___/\____/\_| |_/\_| \_/  \_| \_/\___/\_____/\____/\____/ \___/\_| \_/\____/        //
//                                                                                            //
//      Isak Arnar Kolbeins                                                                   //
//                                                                                            //
//      Verkefni 2, Tolvugrafik 2019                                                          //
//                                                                                            //
//      Verkfaeri fyrir breitingar                                                            //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////


// Conversion from radians to degrees
function toDegrees (angle) { 
    return angle * (180 / Math.PI);
}

// Conversion from degrees to radians
function toRadians (angle) { 
    return angle * (Math.PI / 180)
}   

// Conversion from from spherical coordinates to cartesian coordinates
function sphToCart({a,b}){
    return {x: Math.sin(a)*Math.cos(b),    y: Math.sin(a)*Math.sin(b),    z: Math.cos(a)};
}

// Conversion from from cartesian coordinates to spherical coordinates 
function cartToSph({x,y,z}){
    var p = Math.sqrt(x**2 + y**2 + z**2);
    return {a: Math.acos(z/p),  b: Math.atan2(y,x)};
}

// Returns a random direction in the 3d plane, both spherical and cartesian coordinates
function randomDir(){
    var a = toRadians(Math.random()*180);
    var b = toRadians(Math.random()*360);
    return {sph: {a, b},    cart: sphToCart({a,b})};
}

// Returns a random position in cartesian coordinates within the +/- limit on all axis
function randomPos(limit){
    var x = Math.random()*2*limit-limit;
    var y = Math.random()*2*limit-limit;
    var z = Math.random()*2*limit-limit;
    return {x,y,z};
}

// Returns the next fish position
function nextPos(fish){
    return {
        x: fish.pos.x + fish.dir.cart.x*(fish.speed*speed),
        y: fish.pos.y + fish.dir.cart.y*(fish.speed*speed),
        z: fish.pos.z + fish.dir.cart.z*(fish.speed*speed)};
}

// The distance between two fishes
function calcDist(f1, f2) {
    return (Math.sqrt((f1.pos.x-f2.pos.x)**2 + (f1.pos.y-f2.pos.y)**2 + (f1.pos.z-f2.pos.z)**2));
}

// The average direction of directional 3d vectors
function calcAvgXYZ(arr){
    var len = arr.length;
    var tot = {x:0, y:0, z:0};
    arr.map(curr => { Object.keys(tot).map(d => { tot[d] += curr.dir[d] }) });
    return {x: tot.x/len, y: tot.y/len, z: tot.z/len};
}

// Calculates the direction of obj based on seperation, cohesion and alignment and their force
function calcDir(sep, coh, align, curr) {
    return {
        x : curr.x + (+sep.x*sepForce + coh.x*cohForce + align.x*alignForce)%1 ,
        y : curr.y + (+sep.y*sepForce + coh.y*cohForce + align.y*alignForce)%1 ,
        z : curr.z + (+sep.z*sepForce + coh.z*cohForce + align.z*alignForce)%1 ,
    }
}

// Normalizes a vector
function normalizeXYZ({x,y,z}){
    var len = Math.sqrt(x**2 + y**2+ z**2);
    return {x:x/len, y:y/len, z:z/len}
}

// Returns a normalized directional vector from a point to another
function getDirFromPos(from, to, dist){
    return {x: (to.x-from.x)/dist,
            y: (to.y-from.y)/dist,
            z: (to.z-from.z)/dist}
}
