document.addEventListener('DOMContentLoaded', () => {
    updateApplication();    
    window.app?.checkIfUpdateAvailable();
})

function updateApplication() {
    try {
        const newVersionDiv = document.querySelector('.new-version');
        const downloadButton = document.querySelector('.download');
        const downloadProgress = document.querySelector('.progress');

        // Show the update available notification
        window?.app?.onUpdateAvailable(() => {
            newVersionDiv.classList.remove('d-none');
        });

        // Handle download button clickcd
        downloadButton.addEventListener('click', () => {
            window?.app?.requestDownload();
            downloadButton.classList.add('disabled');
            downloadProgress.classList.remove('d-none')
        });

        // Update progress bar
        window?.app?.onDownloadProgress((percent) => {
            document.getElementById('progressBar').style.width = `${Math.round(percent)}%`;
            document.getElementById('progressBar').textContent = `${Math.round(percent)}%`;
        });

        // Prompt user to install after download
        window?.app?.onUpdateDownloaded(() => {
            // window?.app?.requestInstall();
            document.getElementById('progressBar').textContent = 'Download complete. Restarting in 5 seconds...';
            setTimeout(() => {
                window?.app?.requestInstall();
            }, 5000);
        });
    } catch (error) {
        console.log(error);
    }
}