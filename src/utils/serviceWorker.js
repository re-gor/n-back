export class ServiceWorkerUtility {
    static WORKER_PATH = './sw.js'
    static #worker = null;
    static async register () {
        if (ServiceWorkerUtility.#worker) {
            return;
        }

        if ('serviceWorker' in navigator) {
            return navigator.serviceWorker.register(ServiceWorkerUtility.WORKER_PATH, {scope: './'})
                .then((reg) => {
                    console.log('Service Worker registration succeeded. Scope is ' + reg.scope);
                    this.#worker = new Worker(ServiceWorkerUtility.WORKER_PATH);

                    return true;
                }).catch((error) => {
                    console.error('Service Worker registration failed with ' + error);
                    
                    return false;
                });
        } else {
            console.error('Service worker is not supported');
            
            return false;
        }
    }

    static async reloadAssets() {
        if (ServiceWorkerUtility.#worker) {
            ServiceWorkerUtility.#worker.postMessage({action: 'reloadAssets'});
        }
    }

    static async uninstall() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(
                registrations => {
                    for(let registration of registrations) {
                        registration.unregister()
                    } 

                    ServiceWorkerUtility.#worker = null;
                }
            )
        } else {
            console.error('Service worker is not supported')
        }
    }
}
