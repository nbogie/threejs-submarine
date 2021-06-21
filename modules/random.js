import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

export function pick(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}
export function randomAroundZero(v){
    return -v + Math.random() * 2 * v;
}
export function vecRandomAroundZero(rotMax) {
    return new THREE.Vector3(randomAroundZero(rotMax),
        randomAroundZero(rotMax),
        randomAroundZero(rotMax));
}

export function dumpObjectToConsoleAsString(root) {
    console.log(dumpObjectToTextLines(root).join("\n"))
}

function dumpObjectToTextLines(obj, lines = [], isLast = true, prefix = '') {
    if (!obj || !obj.children) {
        return lines;
    }
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObjectToTextLines(child, lines, isLast, newPrefix);
    });
    return lines;
}


