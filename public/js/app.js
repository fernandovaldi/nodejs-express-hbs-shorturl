console.log("front-end en carpeta public");

document.addEventListener('click', e => {
    if(e.target.dataset.short){
        const url = `${window.location.origin}/${e.target.dataset.short}`;

        navigator.clipboard
        .writeText(url)
        .then(() => {
            console.log("Texto copiado en el portapapeles...");
        })
        .catch((err) => {
            console.log("Algo fue mal... " + err);
        });
    }
});
