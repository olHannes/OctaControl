document.addEventListener("DOMContentLoaded", () => {
    
    const container = document.querySelector('.widget-container');
    function updateScale() {
        return;
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;

        container.querySelectorAll('.widget-collection > *').forEach(widget => {
            const rect = widget.getBoundingClientRect();
            const widgetCenterX = rect.left + rect.width / 2;

            const distance = Math.abs(centerX - widgetCenterX);
            const maxDistance = containerRect.width / 2;
            const proximity = Math.max(0, 1 - distance / maxDistance);

            const scale = 1 + 0.1 * proximity;
            const extraMargin = 10 * proximity;

            widget.style.transform = `scale(${scale})`;
            widget.style.marginLeft = `${extraMargin}px`;
            widget.style.marginRight = `${extraMargin}px`;
        });
    }

    container.addEventListener('scroll', updateScale);
    window.addEventListener('resize', updateScale);
    updateScale();
});



function toggleSettings(){
    const panel = document.getElementById('settings');
    const container = document.getElementById('widget-container');

    const isVisible = panel.classList.contains('show');

    if (!isVisible) {
        panel.style.display = "flex";
        
        requestAnimationFrame(() => {
            panel.classList.add('show');

            setTimeout(() => {
                panel.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
            }, 50);
        });
    } else {
        panel.classList.remove('show');

        setTimeout(() => {
            panel.style.display = "none";
            panel.removeEventListener('transitionend', handler);
        }, 400);
    }
}
