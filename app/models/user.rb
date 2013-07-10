require 'bcrypt'

class User < ActiveRecord::Base
  attr_accessible :password, :username, :session_token, 
    :first_name, :last_name, :bio, :city, :country_code, :profile_picture

  validates :username, presence: true, uniqueness: true
  validates :password_digest, presence: true, length: { minimum: 6 }
  # validates :city, presence: true, length: { minimum: 2 } 

  # has_many :profile_images
  has_many :tracks, foreign_key: :owner_id
  has_many :play_sets, foreign_key: :owner_id, dependent: :destroy

  has_many :likes, dependent: :destroy
  has_many :liked_tracks, through: :likes, source: :track

  has_many :comments, foreign_key: :author_id, dependent: :destroy

  has_many :followings, foreign_key: :follower_id, dependent: :destroy
  has_many :followed_users, through: :followings
  has_many :reverse_followings, foreign_key: :followed_user_id, class_name: "Following", dependent: :destroy
  has_many :followers, through: :reverse_followings 

  has_attached_file :profile_picture

  def password=(password)
  	self.password_digest = BCrypt::Password.create(password)
  end

  def verify_password(password)
  	BCrypt::Password.new(self.password_digest) == password
  end

  def profile_picture_url
    self.profile_picture.url
  end

  def as_json(options = {})
    super(:except => [
      :password_digest, 
      :session_token
    ], 
    :methods => :profile_picture_url,
    :include => [
      { :likes => { :include => :track }},
      { :play_sets => { :include => :tracks }},
      { :tracks => { :methods => :audio_url, :include => [:comments => { :methods => :profile_picture_url }] }},
      :comments,
      :followers,
      :followed_users 
    ])
  end

end
