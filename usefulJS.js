var id = 1
document.getElementById("createBox").onClick = giveBoxId()

function giveBoxId(){

    const flexbox = document.getElementById("container")
    const newBox = document.createElement('div');
    newBox.className = 'box';
    newBox.id = 
    newBox.textContent = 'Photos';
    newBox.onClick = showImages("images/photos"+i+".jpg");
    i+=1;
    container.appendChild(newBox);
}

function showImages(){
    const overlay = document.getElementById("imageOverlay");
    const image = document.createElement("img")
    image.src=images/photo
}