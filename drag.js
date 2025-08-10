let isDragging = false;
let x1 = 0;
let x2 = 0;
let t2 = 0;
let v = 0;
let currentOffset = 0;

function Drag(X) {
    const boxes = document.querySelectorAll('.box');
    isDragging = true;
    dragged = false;
    x1 = X;
    x2 = X;
    t1 = performance.now();

    container.onmousemove = (e) => {
        if (!isDragging) return;

        const createBox = document.getElementById("createBox");
        if(!createBox) console.log("fck")

        x2 = e.clientX;
        const dx = x2 - x1; // from start point

        // Only update the DOM with relative dx
        currentOffset += dx;
        boxes.forEach(box => {
            box.style.transform = `translateX(${currentOffset}px)`;
        });
        createBox.style.transform = `translateX(${currentOffset}px)`;
            
        // Velocity calc using *frame delta*
        const t2 = performance.now();
        const dt = t2 - t1;
        if (dt > 0) {
            v = dx / dt;
        }

        x1 = x2;
        t1 = t2;

        if (Math.abs(dx) > 5) dragged = true;
    };

    container.onmouseup = endDrag;
    container.onmouseleave = endDrag;
}


function endDrag() {
    if (!isDragging) return;
    isDragging = false;

    if (dragged) {
        animateVelocity(v*10); // add momentum
    }
}



function animateVelocity(v) {
    const boxes = document.querySelectorAll('.box');
    const createBox = document.getElementById("createBox");

    function step() {
        if (Math.abs(v) < 0.1) return;

        currentOffset += v;

        boxes.forEach(box => {
            box.style.transform = `translateX(${currentOffset}px)`;
        });
        
        createBox.style.transform = `translateX(${currentOffset}px)`;

        v *= 0.93; // Friction
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}
