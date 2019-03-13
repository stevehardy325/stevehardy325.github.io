pipeline {
  agent {
    docker {
      image 'jekyll/builder'
    }

  }
  stages {
    stage('Dependencies') {
      steps {
        sh 'bundle install'
      }
    }
    stage('Build') {
      steps {
        sh 'bundle exec jekyll build'
      }
    }
    stage('Test') {
      steps {
        sh 'bundle exec htmlproofer ./_site --disable-external'
      }
    }
  }
}