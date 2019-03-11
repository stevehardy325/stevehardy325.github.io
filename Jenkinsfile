pipeline {
  agent {
    docker {
      image 'jekyll/builder'
    }

  }
  stages {
    stage('Update') {
      steps {
        git 'https://github.com/stevehardy325/stevehardy325.github.io'
      }
    }
    stage('Dependencies') {
      steps {
        sh 'bundle install'
      }
    }
    stage('Build') {
      steps {
        sh 'bash script/cibuild'
      }
    }
  }
}