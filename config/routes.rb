SoundStorm::Application.routes.draw do
  root to: "root#root"
  resources :play_sets
  resources :users do
  	# resources :tracks
  end
  resources :tracks
  resource :session

end
