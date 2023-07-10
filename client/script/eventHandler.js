$('div[name="contAllFiles"]').on('dragenter', function(event) {
    event.preventDefault();
});
$('div[name="contAllFiles"]').on('dragover', function(event) {
    event.preventDefault();
});
$('div[name="contAllFiles"]').on('dragleave', function(event) {
    event.preventDefault();
});

$('div[name="contAllFiles"]').on('drop', function(event) {
    event.preventDefault();
    const files = event.originalEvent.dataTransfer.files;

    if (files.length == 1) {
        upload(files[0]);
    }
});

function upload(file) {
    const chunkSize = 1 * 1000 * 1000; // 3MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    function sendChunk() {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        if (currentChunk < totalChunks) {
            updateProgressBar(file.size, chunkSize * (currentChunk + 1));
            socket.emit('fileChunk', {
                fileName: file.name,
                fileChunk: chunk
            });
        } else {
            closeProgressBar();
            socket.off('requestChunk');
            socket.emit('fileEnd');
            return;
        }
    }

    socket.on('requestChunk', function(data) {
        currentChunk = currentChunk + 1;
        sendChunk();
    });

    sendChunk();
}

function updateProgressBar(fileSize, sentSize) {
    let progress = getFileSize(sentSize) + '/' + getFileSize(fileSize);
    let percentage = (sentSize / fileSize) * 100;
    $("div[name='uploadProgress']").css("display", "flex");
    $("p[name='uploadProgressText']").text(progress);
    $("progress[name='uploadProgressBar']").val(percentage);
}

function closeProgressBar() {
    $("div[name='uploadProgress']").css("display", "none");
}